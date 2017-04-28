class AddDefaultToCoursesHasPasscode < ActiveRecord::Migration[5.0]
  def change
  	change_column_default :courses, :has_passcode, from: nil, to: true
  end
end
