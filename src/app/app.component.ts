import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraphqlService, Student } from './graphql.service';
import { ChartsComponent } from './charts/charts.component';

import {
  IonApp, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonButtons, IonItem, IonInput, IonLabel,
  IonBadge, IonSpinner, IonText, IonIcon,
  IonGrid, IonRow, IonCol, IonNote,
  AlertController, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, refreshOutline, trashOutline,
  createOutline, barChartOutline, listOutline,
  checkmarkCircleOutline, closeCircleOutline,
  schoolOutline, analyticsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChartsComponent,
    IonApp, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonButtons, IonItem, IonInput, IonLabel,
    IonBadge, IonSpinner, IonText, IonIcon,
    IonGrid, IonRow, IonCol, IonNote,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  students: Student[] = [];
  loading = false;
  error = '';
  showCharts = false;

  newName = '';
  newEmail = '';

  editingId: number | null = null;
  editName = '';
  editEmail = '';

  marksEditingId: number | null = null;
  editEnglish = 0;
  editTamil = 0;
  editMaths = 0;

  constructor(
    private gql: GraphqlService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      addCircleOutline, refreshOutline, trashOutline,
      createOutline, barChartOutline, listOutline,
      checkmarkCircleOutline, closeCircleOutline,
      schoolOutline, analyticsOutline
    });
  }

  toggleCharts() {
    this.showCharts = !this.showCharts;
  }

  ngOnInit() { this.loadStudents(); }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async loadStudents() {
    this.loading = true;
    this.error = '';
    try {
      this.students = (await this.gql.getStudents()).sort((a, b) => a.id - b.id);
    } catch (e: unknown) {
      this.error = (e as Error).message;
      await this.showToast('Failed to load students: ' + (e as Error).message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async addStudent() {
    if (!this.newName.trim() || !this.newEmail.trim()) {
      await this.showToast('Please fill in both Name and Email.', 'warning');
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const student = await this.gql.createStudent(this.newName.trim(), this.newEmail.trim());
      this.students = [...this.students, student].sort((a, b) => a.id - b.id);
      this.newName = '';
      this.newEmail = '';
      await this.showToast(`✅ ${student.name} added successfully!`);
    } catch (e: unknown) {
      this.error = (e as Error).message;
      await this.showToast('Error adding student: ' + (e as Error).message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  startEdit(student: Student) {
    this.editingId = student.id;
    this.editName = student.name;
    this.editEmail = student.email;
    this.marksEditingId = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.editName = '';
    this.editEmail = '';
  }

  async saveEdit(id: number) {
    if (!this.editName.trim() || !this.editEmail.trim()) {
      await this.showToast('Name and Email cannot be empty.', 'warning');
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const updated = await this.gql.updateStudent(id, this.editName.trim(), this.editEmail.trim());
      this.students = this.students.map(s => s.id === id ? updated : s);
      this.cancelEdit();
      await this.showToast('✅ Student updated!');
    } catch (e: unknown) {
      this.error = (e as Error).message;
      await this.showToast('Error updating student: ' + (e as Error).message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  startMarksEdit(student: Student) {
    this.marksEditingId = student.id;
    this.editEnglish = student.english;
    this.editTamil = student.tamil;
    this.editMaths = student.maths;
    this.editingId = null;
  }

  cancelMarksEdit() {
    this.marksEditingId = null;
    this.editEnglish = 0;
    this.editTamil = 0;
    this.editMaths = 0;
  }

  async saveMarks(id: number) {
    if (this.editEnglish < 0 || this.editEnglish > 100 ||
        this.editTamil < 0 || this.editTamil > 100 ||
        this.editMaths < 0 || this.editMaths > 100) {
      await this.showToast('Marks must be between 0 and 100.', 'warning');
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const updated = await this.gql.updateMarks(id, this.editEnglish, this.editTamil, this.editMaths);
      this.students = this.students.map(s => s.id === id ? updated : s);
      this.cancelMarksEdit();
      await this.showToast('✅ Marks updated!');
    } catch (e: unknown) {
      this.error = (e as Error).message;
      await this.showToast('Error updating marks: ' + (e as Error).message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async deleteStudent(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Student',
      message: 'Are you sure you want to permanently delete this student?',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'alert-cancel-btn' },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'alert-delete-btn',
          handler: async () => {
            this.loading = true;
            this.error = '';
            try {
              await this.gql.deleteStudent(id);
              this.students = this.students.filter(s => s.id !== id);
              await this.showToast('🗑️ Student deleted.');
            } catch (e: unknown) {
              this.error = (e as Error).message;
              await this.showToast('Error deleting student: ' + (e as Error).message, 'danger');
            } finally {
              this.loading = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  get editTotal(): number {
    return (this.editEnglish || 0) + (this.editTamil || 0) + (this.editMaths || 0);
  }
}


