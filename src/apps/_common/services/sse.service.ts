import { Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';

export class SseService {
  static responsesByClientMap = new Map<string, Response>();
  static responsesByUserIdMap = new Map<number, Map<string, Response>>();
  static subscribersByEventType = new Map<string, Map<number, boolean>>();

  public static subscribeToEvent(options: {
    userId: number;
    request: Request;
    response: Response;
  }) {
    const { userId, request, response } = options;

    const eventType = request.params.event_type;
    if (!eventType) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'event type is required'
      });
    }

    // const unknownEventType = !(eventType in COMMON_EVENT_TYPES);
    // if (unknownEventType) {
    //   return response.status(HttpStatusCode.BAD_REQUEST).json({
    //     message: 'event type is unknown'
    //   });
    // }

    let eventSubscribers = SseService.subscribersByEventType.get(eventType);
    if (!eventSubscribers) {
      eventSubscribers = new Map<number, boolean>();
      eventSubscribers.set(userId, true)
      SseService.subscribersByEventType.set(eventType, eventSubscribers);
    } else {
      if (!eventSubscribers.has(userId)) {
        eventSubscribers.set(userId, true);
      }
    }

    return response.status(HttpStatusCode.OK).json({
      message: `user subscribed to ${eventType}.`
    });
  }

  public static unsubscribeToEvent(options: {
    userId: number;
    request: Request;
    response: Response;
  }) {
    const { userId, request, response } = options;

    const eventType = request.params.event_type;
    if (!eventType) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'event type is required'
      });
    }

    // const unknownEventType = !(eventType in COMMON_EVENT_TYPES);
    // if (unknownEventType) {
    //   return response.status(HttpStatusCode.BAD_REQUEST).json({
    //     message: 'event type is unknown'
    //   });
    // }

    let eventSubscribers = SseService.subscribersByEventType.get(eventType);
    if (!eventSubscribers) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'event type had no subscriptions'
      });
    } else {
      const deleteResult = eventSubscribers.delete(userId);

      if (!deleteResult) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: 'user was not subscribed'
        });
      }

      return response.status(HttpStatusCode.OK).json({
        message: `user unsubscribed to ${eventType}.`
      });
    }
  }

  /** User Specific Events */

  private static getOrCreateUserSubscribeResponse(options: {
    userId: number;
    request: Request;
    response: Response;
  }) {
    const { userId, request, response } = options;
    const agent = request.get('User-Agent')!;

    let responsesMap = SseService.responsesByUserIdMap.get(userId);
    if (!responsesMap) {
      responsesMap = new Map<string, Response>();
      SseService.responsesByUserIdMap.set(userId, responsesMap);
    }

    let responseByUserAgent = responsesMap.get(agent);
    if (!responseByUserAgent) {
      responsesMap.set(agent, response);
      responseByUserAgent = response;
    }

    responseByUserAgent.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    responseByUserAgent.on(`close`, () => {
      responseByUserAgent?.end();
      SseService.unsubscribeUserEvents(options);
    });

    return responseByUserAgent;
  }

  public static unsubscribeUserEvents(options: {
    userId: number;
    request: Request;
    response: Response;
  }) {
    const { userId, request, response } = options;
    const agent = request.get('User-Agent')!;

    const responsesMap = SseService.responsesByUserIdMap.get(userId);
    if (responsesMap) {
      let responseByUserAgent = responsesMap.get(agent);
      if (responseByUserAgent) {
        try {
          responseByUserAgent?.end();
        } catch (e) {
          console.log(`SseService.unsubscribeUserEvents error:`, e);
        }
        responsesMap.delete(agent);
      }
    }
  }

  public static subscribeUserEvents(options: {
    userId: number;
    request: Request;
    response: Response;
  }) {
    SseService.getOrCreateUserSubscribeResponse(options);
  }

  public static pushUserEvent(options: {
    userId: number;
    request: Request;
    response: Response;
    event: string;
    data: { [key: string]: any; }
  }) {
    const responseByUserAgent = SseService.getOrCreateUserSubscribeResponse(options);
    if (responseByUserAgent) {
      const content = `event: ${options.event}\ndata: ${JSON.stringify(options.data)}\n\n`;
      responseByUserAgent.write(content);
    }
  }

  /** Public/Global Events */

  private static getOrCreatePublicSubscribeResponse(options: {
    request: Request;
    response: Response;
  }) {
    const { request, response } = options;
    const agent = request.get('User-Agent')!;

    let responseByUserAgent = SseService.responsesByClientMap.get(agent);
    if (!responseByUserAgent) {
      SseService.responsesByClientMap.set(agent, response);
      responseByUserAgent = response;
    }

    responseByUserAgent.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    responseByUserAgent.on(`close`, () => {
      responseByUserAgent?.end();
      SseService.unsubscribePublicEvents(options);
    });

    return responseByUserAgent;
  }

  public static unsubscribePublicEvents(options: {
    request: Request;
    response: Response;
  }) {
    const { request, response } = options;
    const agent = request.get('User-Agent')!;

    let responseByUserAgent = SseService.responsesByClientMap.get(agent);
    if (responseByUserAgent) {
      try {
        responseByUserAgent?.end();
      } catch (e) {
        console.log(`SseService.unsubscribeUserEvents error:`, e);
      }
      SseService.responsesByClientMap.delete(agent);
    }
  }

  public static subscribePublicEvents(options: {
    request: Request;
    response: Response;
  }) {
    SseService.getOrCreatePublicSubscribeResponse(options);
  }

  public static pushPublicEvent(options: {
    request: Request;
    response: Response;
    event: string;
    data: { [key: string]: any; }
  }) {
    const responses_list = SseService.responsesByClientMap.values();
    for (const responseByUserAgent of responses_list) {
      const content = `event: ${options.event}\ndata: ${JSON.stringify(options.data)}\n\n`;
      responseByUserAgent.write(content);
    }
  }
}