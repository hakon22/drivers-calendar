/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import axios from 'axios';
import qs from 'qs';
import { getDigitalCode } from 'node-verification-code';

export const codeGen = () => getDigitalCode(4).toString();

class Sms {
  async sendCode(phone: string): Promise<{ request_id: string, code: string }> {
    try {
      const code = codeGen();
      const object = { to: phone, txt: `Ваш код подтверждения: ${code}` };

      /* const { data } = await axios.post('https://api3.greensms.ru/sms/send', object, {
        headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}` },
      }); */
      const data = { request_id: Date.now().toString(), error: 'null' };
      console.log(code);

      if (data.request_id) {
        return { ...data, code };
      }
      throw Error(data.error);
    } catch (e) {
      console.error(e);
      throw Error('Произошла ошибка при отправке SMS');
    }
  }

  async sendPass(phone: number, pass: string) {
    try {
      const object = {
        method: 'push_msg',
        format: 'json',
        key: process.env.SMS_API_KEY_PASS,
        text: `Ваш пароль для входа: ${pass}`,
        phone,
        sender_name: 'AM-PROJECTS',
      };
      const { data } = await axios.post('https://ssl.bs00.ru', qs.stringify(object));
      console.log(JSON.stringify(data));
    } catch (e) {
      console.error(e);
      throw Error('Произошла ошибка при отправке SMS');
    }
  }
}

export default new Sms();
