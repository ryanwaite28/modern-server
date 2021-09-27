import {
  Request,
  Response,
} from 'express';
import {
  allowedImages,
  hierarchyOptions,
  causesList,
  DURATION_1_DAY_HALF,
  employmentTypes,
  gallupStrengthsList,
  jobFields,
  languagesList,
  predictiveIndexProfilesList
} from '../common.chamber';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import moment from 'moment';
import { Cliques } from '../../hotspot/models/clique.model';
import { NewsDataCache } from '../models/other.model';
import { HotspotResources } from '../../hotspot/models/resource.model';
import { v1 as uuidv1 } from 'uuid';

const lessThanOneDayAgo = (date: any) => {
  return moment(date).isAfter(moment().subtract(1, 'days'));
}

export class InfoService {
  /** Use a cache to store API results for 24 hours at a time */
  static newsApiResults = null;
  private static newsApiRefreshTimeout: any;

  static async get_site_info(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      causesList: causesList,
      jobFields: jobFields.sort(),
      allowedImages: allowedImages.sort(),
      employmentTypes: employmentTypes.sort(),
      predictiveIndexProfilesList: predictiveIndexProfilesList.sort(),
      gallupStrengthsList: gallupStrengthsList.sort(),
      hierarchyOptions,
      languagesList
    });
  }

  static async get_recent_activity(request: Request, response: Response) {
    const resources = await HotspotResources.findAll({
      limit: 1,
      order: [['id', 'DESC']]
    });
    const cliques = await Cliques.findAll({
      limit: 1,
      order: [['id', 'DESC']]
    });

    return response.status(HttpStatusCode.OK).json({
      data: {
        resources,
        cliques
      }
    });
  }

  /** External API calls */

  static async get_business_news(request: Request, response: Response) {
    /**
     * https://docs.microsoft.com/en-us/rest/api/cognitiveservices-bingsearch/bing-news-api-v7-reference#categories-by-market
     * https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/bing-news-search1?endpoint=apiendpoint_0aa346dd-16d6-40d4-930c-235f4b4fb9e6
     */

     // check cache
    if (InfoService.newsApiResults) {
      console.log(`returning news api data from cache`);
      return response.status(HttpStatusCode.OK).json({
        message: `returning news api data from cache`,
        data: InfoService.newsApiResults
      });
    }

    // check database
    const result = await NewsDataCache.findOne();
    if (result) {
      // check age
      const olderThanOneDay = !lessThanOneDayAgo(result.get('date_created'));
      if (olderThanOneDay) {
        // old data, delete from db and get new
        await result.destroy();
      } else {
        // not old enough, load to cache and return
        InfoService.newsApiResults = JSON.parse(result.get('json_data'));
        console.log(`loaded news api data from db`);
        return response.status(HttpStatusCode.OK).json({
          message: `loaded news api data from db`,
          data: InfoService.newsApiResults
        });
      }
    }
    
    console.log(`no valid results in db; go fetch new`);

    const unirest = require("unirest");
    const req = unirest("GET", "https://bing-news-search1.p.rapidapi.com/news");
    req.query({
      "category": "Entertainment",
      "safeSearch": "Off",
      "textFormat": "Raw"
    });
    req.headers({
      "x-rapidapi-host": "bing-news-search1.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-bingapis-sdk": "true",
      "useQueryString": true
    });
    req.end(async (res: any) => {
      if (res.error) {
        console.log(res.error, `could not load results`);
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          message: `error loading from API`
        });
      }

      // set to cache and set timeout
      console.log(`retrieved news data; storing in db and setting to cache`);
      await NewsDataCache.create({
        json_data: JSON.stringify(res.body)
      });
      InfoService.newsApiResults = res.body;
      InfoService.newsApiRefreshTimeout = setTimeout(() => {
        InfoService.newsApiResults = null;
      }, DURATION_1_DAY_HALF);

      return response.status(HttpStatusCode.OK).json({
        message: `retrieved news data; storing in db and setting to cache`,
        data: res.body,
      });
    });
  }
}