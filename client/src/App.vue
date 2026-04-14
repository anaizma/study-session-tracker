<template>
  <div class="container">
    <h1>Study Session Tracker</h1>

    <div class="form">
      <input v-model="course" placeholder="Course (ex. STAT 312)" />
      <input v-model="duration" placeholder="Duration (ex. 2 hours)" />
      <input v-model="note" placeholder="What did you study?" />

      <button v-if="!editing" @click="createSession">Add Session</button>
      <button v-else @click="updateSession">Save Changes</button>
    </div>

    <p class="error" v-if="error">{{ error }}</p>

    <div class="sessions">
      <div class="session-card" v-for="session in sessions" :key="session._id">
        <p class="date">
          {{ formatDate(session.createdAt) }}
        </p>
        <h3>{{ session.course }}</h3>
        <p><strong>Duration:</strong> {{ session.duration }}</p>
        <p><strong>Note:</strong> {{ session.note }}</p>

        <div class="actions">
          <button @click="startEdit(session)">Edit</button>
          <button @click="deleteSession(session._id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SessionService from "./SessionService";

export default {
  name: "App",

  data() {
    return {
      sessions: [],
      error: "",
      course: "",
      duration: "",
      note: "",
      editing: false,
      editId: null,
    };
  },

  async created() {
    await this.refreshSessions();
  },

  methods: {
    formatDate(date) {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    },

    async refreshSessions() {
      try {
        this.sessions = await SessionService.getSessions();
        this.error = "";
      } catch (err) {
        this.error = "Could not load sessions.";
        console.error("refreshSessions error:", err);
      }
    },

    clearForm() {
      this.course = "";
      this.duration = "";
      this.note = "";
      this.editing = false;
      this.editId = null;
    },

    formIsValid() {
      if (!this.course.trim() || !this.duration.trim() || !this.note.trim()) {
        this.error = "Please fill in course, duration, and note.";
        return false;
      }
      this.error = "";
      return true;
    },

    async createSession() {
      if (!this.formIsValid()) return;

      try {
        await SessionService.insertSession({
          course: this.course,
          duration: this.duration,
          note: this.note,
        });

        await this.refreshSessions();
        this.clearForm();
      } catch (err) {
        this.error = "Could not add session.";
        console.error("createSession error:", err);
      }
    },

    startEdit(session) {
      this.course = session.course;
      this.duration = session.duration;
      this.note = session.note;
      this.editing = true;
      this.editId = session._id;
      this.error = "";
    },

    async updateSession() {
      if (!this.formIsValid()) return;

      try {
        await SessionService.updateSession(this.editId, {
          course: this.course,
          duration: this.duration,
          note: this.note,
        });

        await this.refreshSessions();
        this.clearForm();
      } catch (err) {
        this.error = "Could not update session.";
        console.error("updateSession error:", err);
      }
    },

    async deleteSession(id) {
      try {
        await SessionService.deleteSession(id);
        await this.refreshSessions();
        this.error = "";
      } catch (err) {
        this.error = "Could not delete session.";
        console.error("deleteSession error:", err);
      }
    },
  },
};
</script>

<style>
body {
  margin: 0;
  background: #f4f6fb;
  font-family: Arial, sans-serif;
  color: #1f2937;
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #1e2a44;
}

.form {
  display: grid;
  gap: 12px;
  margin-bottom: 28px;
}

.form input {
  padding: 14px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  color: #111827;
}

.form input::placeholder {
  color: #6b7280;
}

.form button {
  padding: 14px;
  font-size: 15px;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-weight: 600;
}

.form button:hover {
  background: #4338ca;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

.sessions {
  display: grid;
  gap: 18px;
}

.session-card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  color: #111827;
}

.session-card h3 {
  margin: 8px 0 10px;
  color: #1f2937;
}

.session-card p {
  margin: 6px 0;
  color: #374151;
}

.date {
  font-size: 12px;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.actions button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #e0e7ff;
  color: #312e81;
  font-weight: 600;
}

.actions button:hover {
  background: #c7d2fe;
}
</style>