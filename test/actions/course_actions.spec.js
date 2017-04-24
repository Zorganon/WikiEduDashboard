import '../testHelper';
import CourseActions from '../../app/assets/javascripts/actions/course_actions.js';
import CourseStore from '../../app/assets/javascripts/stores/course_store.js';

import sinon from 'sinon';

describe('CourseActions', () => {
  beforeEach(() => {
    sinon.stub($, "ajax").yieldsTo("success", { course: { title: 'Bar' } });
  });
  afterEach(() => {
    $.ajax.restore();
  });

  it('.addCourse initializes a minimal course in the store', (done) => {
    CourseActions.addCourse().then(() => {
      expect(CourseStore.getCourse().weekdays).to.eq('0000000');
      done();
    });
  });

  it('.updateCourse sets course data in the store but not the persisted version', (done) => {
    const course = { title: 'Foo' };
    CourseActions.updateCourse(course).then(() => {
      expect(CourseStore.getCourse().title).to.eq('Foo');
      done();
    });
  });

  it('.persistCourse pushes course data to server via ajax then updates with returned data', (done) => {
    const course = { title: 'Foo' };
    CourseActions.persistCourse(course).then(() => {
      expect(CourseStore.getCourse().title).to.eq('Bar');
      done();
    });
  });

  it('CourseStore saves editathon type', (done) => {
    const course = { title: 'Foo', type: 'Editathon', password: 'pizza', subject: 'cooking', slug: 'blom' };
    CourseActions.addCourse();
    CourseActions.updateCourse(course).then(() => {
      expect(CourseStore.getCourse().type).to.eq('Editathon');
      done();
    });
  });

  it('CourseStore knows editathon has_password', (done) => {
    const course = { title: 'Foo', type: 'Editathon', password: 'pizza', subject: 'cooking', slug: 'blom', has_password: 'true' };
    CourseActions.addCourse();
    CourseActions.updateCourse(course).then(() => {
      expect(CourseStore.getCourse().has_password).to.eq('true');
      done();
    });
  });
});



