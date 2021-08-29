import Nexmo from 'nexmo';
import { PlainObject } from './apps/_common/interfaces/common.interface';

export function send_sms(params: {
  phone_number: string,
  message: string
}) {
  return new Promise((resolve, reject) => {
    const { phone_number, message } = params;
    if (!phone_number) {
      console.log(`PHONE NUMBER REQUIRED...`);
      return reject();
    }
    if (!message) {
      console.log(`MESSAGE REQUIRED...`);
      return reject();
    }

    const apiKey = process.env.NEXMO_API_KEY;
    if (!apiKey) {
      console.log(`NEXMO API KEY REQUIRED...`);
      return reject();
    }
    const apiSecret = process.env.NEXMO_API_SECRET;
    if (!apiSecret) {
      console.log(`NEXMO API SECRET REQUIRED...`);
      return reject();
    }

    let nexmo;
    try {
      nexmo = new Nexmo({ apiKey, apiSecret }, { debug: true });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }

    try {
      nexmo.verify.request({
        number: phone_number,
        brand: process.env.APP_NAME!,
        code_length: 6
      }, (err, result) => {
        return err
          ? reject(err)
          : resolve(result);
      });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }
  });
}

export function send_verify_sms_request(phone_number: string): Promise<PlainObject> {
  return new Promise((resolve, reject) => {
    if (!phone_number) {
      console.log(`REQUIEST ID REQUIRED...`);
      return reject();
    }
    
    const apiKey = process.env.NEXMO_API_KEY;
    if (!apiKey) {
      console.log(`NEXMO API KEY REQUIRED...`);
      return reject();
    }
    const apiSecret = process.env.NEXMO_API_SECRET;
    if (!apiSecret) {
      console.log(`NEXMO API SECRET REQUIRED...`);
      return reject();
    }

    let nexmo;
    try {
      nexmo = new Nexmo({ apiKey, apiSecret }, { debug: true });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }

    try {
      nexmo.verify.request({
        number: phone_number,
        brand: process.env.APP_NAME!,
        code_length: 6
      }, (err, result) => {
        return err
          ? reject(err)
          : resolve(result);
      });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }
  });
}

export function cancel_verify_sms_request(request_id: string) {
  return new Promise((resolve, reject) => {
    if (!request_id) {
      console.log(`REQUIEST ID REQUIRED...`);
      return reject();
    }

    const apiKey = process.env.NEXMO_API_KEY;
    if (!apiKey) {
      console.log(`NEXMO API KEY REQUIRED...`);
      return reject();
    }
    const apiSecret = process.env.NEXMO_API_SECRET;
    if (!apiSecret) {
      console.log(`NEXMO API SECRET REQUIRED...`);
      return reject();
    }

    let nexmo;
    try {
      nexmo = new Nexmo({ apiKey, apiSecret }, { debug: true });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }

    try {
      nexmo.verify.control({ request_id, cmd: 'cancel' }, (err, result) => {
        return err
          ? reject(err)
          : resolve(result);
      });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }
  });
}

export function check_verify_sms_request(params: {
  request_id: string,
  code: string
}): Promise<PlainObject> {
  return new Promise((resolve, reject) => {
    const { request_id, code } = params;
    if (!request_id) {
      console.log(`REQUIEST ID REQUIRED...`);
      return reject();
    }
    if (!code) {
      console.log(`VERIFICATION CODE REQUIRED...`);
      return reject();
    }
  
    const apiKey = process.env.NEXMO_API_KEY;
    if (!apiKey) {
      console.log(`NEXMO API KEY REQUIRED...`);
      return reject();
    }
    const apiSecret = process.env.NEXMO_API_SECRET;
    if (!apiSecret) {
      console.log(`NEXMO API SECRET REQUIRED...`);
      return reject();
    }

    let nexmo;
    try {
      nexmo = new Nexmo({ apiKey, apiSecret }, { debug: true });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }

    try {
      nexmo.verify.check({ request_id, code }, (err, result) => {
        return err
          ? reject(err)
          : resolve(result);
      });
    } catch (e) {
      console.log(`COULD NOT INITIALIZE NEXMO...`, e);
      return reject(e);
    }
  });
}