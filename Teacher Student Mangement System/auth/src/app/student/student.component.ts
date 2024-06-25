import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  students$: Observable<any[]>;
  newStudent: any = {};
  editMode = false;
  selectedStudent: any = {};

  constructor(private studentService: StudentService) {
    this.students$ = this.studentService.students$;
  }

  ngOnInit(): void {
    // The service automatically fetches students on creation
  }

  addStudent(): void {
    this.studentService.createStudent(this.newStudent)
      .subscribe(
        () => {
          this.newStudent = {};
        },
        (error) => {
          console.error('Error adding student:', error);
        }
      );
  }

  deleteStudent(studentId: string): void {
    this.studentService.deleteStudent(studentId)
      .subscribe(
        () => {
          // Updating the students list without re-fetching
          const index = this.studentService.studentsSubject.value.findIndex(student => student._id === studentId);
          if (index !== -1) {
            const updatedStudents = [...this.studentService.studentsSubject.value];
            updatedStudents.splice(index, 1);
            this.studentService.studentsSubject.next(updatedStudents);
          }
        },
        (error) => {
          console.error('Error deleting student:', error);
        }
      );
  }

  editStudent(student: any): void {
    this.editMode = true;
    this.selectedStudent = { ...student };
  }

  saveEditedStudent(): void {
    if (!this.selectedStudent._id) {
      return;
    }

    this.studentService.updateStudent(this.selectedStudent._id, this.selectedStudent)
      .subscribe(
        () => {
          this.cancelEdit();
        },
        (error) => {
          console.error('Error updating student:', error);
        }
      );
  }

  cancelEdit(): void {
    this.editMode = false;
    this.selectedStudent = {};
  }
}
