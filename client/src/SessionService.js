import axios from "axios";

const url =
  import.meta.env.DEV
    ? "http://localhost:5001/api/sessions/"
    : "/api/sessions/";

class SessionService {
  static async getSessions() {
    const res = await axios.get(url);
    return res.data.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
    }));
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