/* ---------- Core logic (no DOM, fully testable) ---------- */
class StudentManager {
  constructor(students = []) {
    this.students = students;
    this.nextId = students.reduce((m, s) => Math.max(m, s.id), 0) + 1;
  }

  static validate(data) {
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const course = (data.course || '').trim();
    const grade = Number(data.grade);
    if (!name) return 'Enter the student’s name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!course) return 'Enter a course.';
    if (data.grade === '' || data.grade == null || Number.isNaN(grade) || grade < 0 || grade > 100) {
      return 'Grade must be a number from 0 to 100.';
    }
    return null;
  }

  add(data) {
    const error = StudentManager.validate(data);
    if (error) throw new Error(error);
    const student = {
      id: this.nextId++,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      course: data.course.trim(),
      grade: Number(data.grade),
    };
    this.students.push(student);
    return student;
  }

  update(id, data) {
    const student = this.students.find((s) => s.id === id);
    if (!student) throw new Error('Student not found.');
    const error = StudentManager.validate(data);
    if (error) throw new Error(error);
    Object.assign(student, {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      course: data.course.trim(),
      grade: Number(data.grade),
    });
    return student;
  }

  remove(id) {
    const before = this.students.length;
    this.students = this.students.filter((s) => s.id !== id);
    return this.students.length < before;
  }

  search(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [...this.students];
    return this.students.filter((s) =>
      [s.name, s.email, s.course].some((f) => f.toLowerCase().includes(q)));
  }

  averageGrade() {
    if (!this.students.length) return 0;
    const total = this.students.reduce((sum, s) => sum + s.grade, 0);
    return Math.round((total / this.students.length) * 10) / 10;
  }
}

/* ---------- Browser UI ---------- */
if (typeof document !== 'undefined') {
  const STORAGE_KEY = 'sms.students';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { saved = []; }
  const manager = new StudentManager(saved);

  const $ = (id) => document.getElementById(id);
  const fields = { name: $('name'), email: $('email'), course: $('course'), grade: $('grade') };
  let editingId = null;

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(manager.students)); } catch (e) { /* storage unavailable */ }
  };

  const readForm = () => ({
    name: fields.name.value, email: fields.email.value,
    course: fields.course.value, grade: fields.grade.value,
  });

  const resetForm = () => {
    Object.values(fields).forEach((f) => { f.value = ''; });
    editingId = null;
    $('form-title').textContent = 'Add student';
    $('saveBtn').textContent = 'Add student';
    $('cancelBtn').hidden = true;
    $('error').textContent = '';
  };

  const cell = (text) => {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  };

  const render = () => {
    const rows = manager.search($('search').value);
    const tbody = $('tbody');
    tbody.innerHTML = '';
    rows.forEach((s) => {
      const tr = document.createElement('tr');
      tr.append(cell(s.name), cell(s.email), cell(s.course), cell(s.grade));

      const td = document.createElement('td');
      td.className = 'actions';
      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'small ghost';
      edit.onclick = () => startEdit(s.id);
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'small danger';
      del.onclick = () => {
        manager.remove(s.id);
        if (editingId === s.id) resetForm();
        persist(); render();
      };
      td.append(edit, del);
      tr.append(td);
      tbody.append(tr);
    });
    $('empty').hidden = manager.students.length > 0;
    const n = manager.students.length;
    $('summary').textContent =
      `${n} student${n === 1 ? '' : 's'}` + (n ? ` · average grade ${manager.averageGrade()}` : '');
  };

  const startEdit = (id) => {
    const s = manager.students.find((x) => x.id === id);
    if (!s) return;
    editingId = id;
    Object.keys(fields).forEach((k) => { fields[k].value = s[k]; });
    $('form-title').textContent = 'Edit student';
    $('saveBtn').textContent = 'Save changes';
    $('cancelBtn').hidden = false;
    fields.name.focus();
  };

  $('saveBtn').onclick = () => {
    try {
      if (editingId === null) manager.add(readForm());
      else manager.update(editingId, readForm());
      resetForm(); persist(); render();
    } catch (err) {
      $('error').textContent = err.message;
    }
  };
  $('cancelBtn').onclick = resetForm;
  $('search').addEventListener('input', render);

  render();
}

if (typeof module !== 'undefined') module.exports = { StudentManager };
