# frozen_string_literal: true
json.assignments course.assignments do |assignment|
  json.partial! 'assignments/assignment', course: assignment.course, assignment: assignment
end
