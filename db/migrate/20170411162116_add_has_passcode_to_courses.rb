class AddHasPasscodeToCourses < ActiveRecord::Migration[5.0]
  def change
  	add_column :courses, :has_passcode, :bool
  end
end