class RemovePasscodeRequiredFromCourses < ActiveRecord::Migration[5.0]
  def change
  	remove_column :courses, :passcode_required
  end
end
