const { StudentManager } = require('./script');

const valid = { name: 'Asha Verma', email: 'asha@example.com', course: 'Physics', grade: 88 };

describe('StudentManager', () => {
  let m;
  beforeEach(() => { m = new StudentManager(); });

  test('adds a student with an id and normalised fields', () => {
    const s = m.add({ ...valid, email: ' ASHA@Example.com ' });
    expect(s.id).toBe(1);
    expect(s.email).toBe('asha@example.com');
    expect(m.students).toHaveLength(1);
  });

  test('assigns unique incrementing ids', () => {
    const a = m.add(valid);
    const b = m.add({ ...valid, name: 'Ravi' });
    expect(b.id).toBe(a.id + 1);
  });

  test.each([
    [{ ...valid, name: '  ' }, /name/i],
    [{ ...valid, email: 'not-an-email' }, /email/i],
    [{ ...valid, course: '' }, /course/i],
    [{ ...valid, grade: 101 }, /grade/i],
    [{ ...valid, grade: -1 }, /grade/i],
    [{ ...valid, grade: '' }, /grade/i],
  ])('rejects invalid input %#', (data, message) => {
    expect(() => m.add(data)).toThrow(message);
    expect(m.students).toHaveLength(0);
  });

  test('updates an existing student', () => {
    const s = m.add(valid);
    m.update(s.id, { ...valid, grade: 95 });
    expect(m.students[0].grade).toBe(95);
  });

  test('update throws for unknown id', () => {
    expect(() => m.update(99, valid)).toThrow(/not found/i);
  });

  test('removes a student', () => {
    const s = m.add(valid);
    expect(m.remove(s.id)).toBe(true);
    expect(m.remove(s.id)).toBe(false);
    expect(m.students).toHaveLength(0);
  });

  test('searches by name, email and course, case-insensitively', () => {
    m.add(valid);
    m.add({ name: 'Ravi Shah', email: 'ravi@school.in', course: 'Chemistry', grade: 70 });
    expect(m.search('ASHA')).toHaveLength(1);
    expect(m.search('school.in')).toHaveLength(1);
    expect(m.search('chem')).toHaveLength(1);
    expect(m.search('')).toHaveLength(2);
    expect(m.search('zzz')).toHaveLength(0);
  });

  test('calculates average grade', () => {
    expect(m.averageGrade()).toBe(0);
    m.add({ ...valid, grade: 80 });
    m.add({ ...valid, name: 'B', grade: 91 });
    expect(m.averageGrade()).toBe(85.5);
  });

  test('continues ids after loading saved students', () => {
    const loaded = new StudentManager([{ id: 7, ...valid }]);
    expect(loaded.add(valid).id).toBe(8);
  });
});
