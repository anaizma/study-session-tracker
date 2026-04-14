import axios from "axios";

const url = "http://localhost:5001/api/sessions/";

class SessionService {
  static getSessions() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.get(url);
        const data = res.data;
        resolve(
          data.map((session) => ({
            ...session,
            createdAt: new Date(session.createdAt),
          }))
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  static insertSession(session) {
    return axios.post(url, session);
  }

  static updateSession(id, session) {
    return axios.put(`${url}${id}`, session);
  }

  static deleteSession(id) {
    return axios.delete(`${url}${id}`);
  }
}

export default SessionService;