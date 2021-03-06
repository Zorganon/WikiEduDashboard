import React from 'react';

import InlineUsers from './inline_users.jsx';
import CampaignButton from './campaign_button.jsx';
import TagButton from './tag_button.jsx';
import CourseTypeSelector from './course_type_selector.jsx';
import SubmittedSelector from './submitted_selector.jsx';

import Editable from '../high_order/editable.jsx';
import TextInput from '../common/text_input.jsx';
import DatePicker from '../common/date_picker.jsx';
import CourseActions from '../../actions/course_actions.js';

import CourseStore from '../../stores/course_store.js';
import TagStore from '../../stores/tag_store.js';
import UserStore from '../../stores/user_store.js';
import CampaignStore from '../../stores/campaign_store.js';

import CourseUtils from '../../utils/course_utils.js';
import CourseDateUtils from '../../utils/course_date_utils.js';
// For some reason getState is not being triggered when CampaignStore gets updated

const getState = () =>
  ({
    course: CourseStore.getCourse(),
    campaigns: CampaignStore.getModels(),
    instructors: UserStore.getFiltered({ role: 1 }),
    online: UserStore.getFiltered({ role: 2 }),
    campus: UserStore.getFiltered({ role: 3 }),
    staff: UserStore.getFiltered({ role: 4 }),
    tags: TagStore.getModels()
  })
;

const Details = React.createClass({
  displayName: 'Details',

  propTypes: {
    course: React.PropTypes.object,
    current_user: React.PropTypes.object,
    instructors: React.PropTypes.array,
    online: React.PropTypes.array,
    campus: React.PropTypes.array,
    staff: React.PropTypes.array,
    campaigns: React.PropTypes.array,
    tags: React.PropTypes.array,
    controls: React.PropTypes.func,
    editable: React.PropTypes.bool
  },

  getInitialState() {
    return getState();
  },

  updateDetails(valueKey, value) {
    const updatedCourse = this.props.course;
    updatedCourse[valueKey] = value;
    return CourseActions.updateCourse(updatedCourse);
  },

  updateSlugPart(valueKey, value) {
    const updatedCourse = this.props.course;
    updatedCourse[valueKey] = value;
    updatedCourse.slug = CourseUtils.generateTempId(updatedCourse);
    return CourseActions.updateCourse(updatedCourse);
  },

  updateCourseDates(valueKey, value) {
    const updatedCourse = CourseDateUtils.updateCourseDates(this.props.course, valueKey, value);
    return CourseActions.updateCourse(updatedCourse);
  },

  canRename() {
    if (!this.props.editable) { return false; }
    if (this.props.current_user.admin) { return true; }
    // On the Wiki Ed dashboard, only admins may rename courses.
    if (Features.wikiEd) { return false; }
    // On P&E Dashboard, anyone with edit rights for the course may rename it.
    return true;
  },

  render() {
    const canRename = this.canRename();
    const instructors = <InlineUsers {...this.props} users={this.props.instructors} role={1} title={CourseUtils.i18n('instructors', this.props.course.string_prefix)} />;
    let online;
    let campus;
    let staff;
    let school;
    if (Features.wikiEd) {
      staff = <InlineUsers {...this.props} users={this.props.staff} role={4} title="Wiki Ed Staff" />;
      online = <InlineUsers {...this.props} users={this.props.online} role={2} title="Online Volunteers" />;
      campus = <InlineUsers {...this.props} users={this.props.campus} role={3} title="Campus Volunteers" />;
    }

    if (this.props.course.school || canRename) {
      school = (
        <TextInput
          onChange={this.updateSlugPart}
          value={this.props.course.school}
          value_key="school"
          editable={canRename}
          type="text"
          label={CourseUtils.i18n('school', this.props.course.string_prefix)}
          required={true}
        />
      );
    }

    let title;
    if (canRename) {
      title = (
        <TextInput
          onChange={this.updateSlugPart}
          value={this.props.course.title}
          value_key="title"
          editable={canRename}
          type="text"
          label={CourseUtils.i18n('title', this.props.course.string_prefix)}
          required={true}
        />
      );
    }

    let term;
    if (this.props.course.term || canRename) {
      term = (
        <TextInput
          onChange={this.updateSlugPart}
          value={this.props.course.term}
          value_key="term"
          editable={canRename}
          type="text"
          label={CourseUtils.i18n('term', this.props.course.string_prefix)}
          required={false}
        />
      );
    }

    let passcode;
    if (this.props.course.passcode || this.props.editable) {
      passcode = (
        <TextInput
          onChange={this.updateDetails}
          value={this.props.course.passcode}
          value_key="passcode"
          editable={this.props.editable}
          type="text"
          label={I18n.t('courses.passcode')}
          placeholder={I18n.t('courses.passcode_none')}
          required={false}
        />
      );
    }

    let expectedStudents;
    if (this.props.course.expected_students || this.props.course.expected_students === 0) {
      expectedStudents = (
        <TextInput
          onChange={this.updateDetails}
          value={String(this.props.course.expected_students)}
          value_key="expected_students"
          editable={this.props.editable}
          type="number"
          label={CourseUtils.i18n('expected_students', this.props.course.string_prefix)}
        />
      );
    }

    const dateProps = CourseDateUtils.dateProps(this.props.course);
    let timelineStart;
    let timelineEnd;
    if (this.props.course.type === 'ClassroomProgramCourse') {
      timelineStart = (
        <DatePicker
          onChange={this.updateCourseDates}
          value={this.props.course.timeline_start}
          value_key="timeline_start"
          editable={this.props.editable}
          validation={CourseDateUtils.isDateValid}
          label={CourseUtils.i18n('assignment_start', this.props.course.string_prefix)}
          date_props={dateProps.timeline_start}
          showTime={this.props.course.use_start_and_end_times}
          required={true}
        />
      );
      timelineEnd = (
        <DatePicker
          onChange={this.updateCourseDates}
          value={this.props.course.timeline_end}
          value_key="timeline_end"
          editable={this.props.editable}
          validation={CourseDateUtils.isDateValid}
          label={CourseUtils.i18n('assignment_end', this.props.course.string_prefix)}
          date_props={dateProps.timeline_end}
          showTime={this.props.course.use_start_and_end_times}
          required={true}
        />
      );
    }
    const lastIndex = this.props.campaigns.length - 1;
    const campaigns = this.props.campaigns.length > 0 ?
      _.map(this.props.campaigns, (campaign, index) => {
        let comma = '';
        const url = `/campaigns/${campaign.slug}/overview`;
        if (index !== lastIndex) { comma = ', '; }
        return <span key={campaign.slug}><a href={url}>{campaign.title}</a>{comma}</span>;
      })
    : I18n.t('courses.none');

    let subject;
    let tags;
    let courseTypeSelector;
    let submittedSelector;
    if (this.props.current_user.admin) {
      const tagsList = this.props.tags.length > 0 ?
        _.map(this.props.tags, 'tag').join(', ')
      : I18n.t('courses.none');

      subject = (
        <div className="subject">
          <span><strong>Subject:</strong> {this.props.course.subject}</span>
        </div>
      );
      tags = (
        <div className="tags">
          <span><strong>Tags:</strong> {tagsList}</span>
          <TagButton {...this.props} show={this.props.editable} />
        </div>
      );
      courseTypeSelector = (
        <CourseTypeSelector
          course={this.props.course}
          editable={this.props.editable}
        />
      );
      submittedSelector = (
        <SubmittedSelector
          course={this.props.course}
          editable={this.props.editable}
        />
      );
    }

    return (
      <div className="module course-details">
        <div className="section-header">
          <h3>{I18n.t('application.details')}</h3>
          {this.props.controls()}
        </div>
        <div className="module__data extra-line-height">
          {instructors}
          {online}
          {campus}
          {staff}
          {school}
          {title}
          {term}
          <form>
            {passcode}
            {expectedStudents}
            <DatePicker
              onChange={this.updateCourseDates}
              value={this.props.course.start}
              value_key="start"
              validation={CourseDateUtils.isDateValid}
              editable={this.props.editable}
              label={I18n.t('courses.start')}
              showTime={this.props.course.use_start_and_end_times}
              required={true}
            />
            <DatePicker
              onChange={this.updateCourseDates}
              value={this.props.course.end}
              value_key="end"
              editable={this.props.editable}
              validation={CourseDateUtils.isDateValid}
              label={I18n.t('courses.end')}
              date_props={dateProps.end}
              enabled={Boolean(this.props.course.start)}
              showTime={this.props.course.use_start_and_end_times}
              required={true}
            />
            {timelineStart}
            {timelineEnd}
          </form>
          <div>
            <span><strong>{CourseUtils.i18n('campaigns', this.props.course.string_prefix)} </strong>{campaigns}</span>
            <CampaignButton {...this.props} show={this.props.editable && canRename && (this.props.course.submitted || this.props.course.type !== 'ClassroomProgramCourse')} />
          </div>
          {subject}
          {tags}
          {courseTypeSelector}
          {submittedSelector}
        </div>
      </div>
    );
  }
}
);

const redirectToNewSlug = () => {
  const newSlug = CourseUtils.generateTempId(CourseStore.getCourse());
  window.location = `/courses/${newSlug}`;
};

// If the course has been renamed, we first warn the user that this is happening.
const saveCourseDetails = (data, courseId = null) => {
  if (!CourseStore.isRenamed()) {
    return CourseActions.persistCourse(data, courseId);
  }
  if (confirm(I18n.t('editable.rename_confirmation'))) {
    return CourseActions.persistAndRedirectCourse(data, courseId, redirectToNewSlug);
  }
};

export default Editable(Details, [CourseStore, UserStore, CampaignStore, TagStore], saveCourseDetails, getState, I18n.t('editable.edit_details'));
