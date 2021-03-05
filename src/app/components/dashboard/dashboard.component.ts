import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import MediumEditor from 'medium-editor';

import { AuthService } from '../../shared/services/auth.service';

declare const MathJax: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('medium') media: ElementRef;
  user;
  editor;

  constructor(
    public authService: AuthService,
    private afStore: AngularFirestore
  ) {
    this.authService.userData.subscribe(res => {
      this.user = res;
      if (this.user) {
        const sub = this.afStore.doc(`content/${this.user.uid}`).get().subscribe((res: any) => {
          if (res.data() && this.editor) {
            this.editor.setContent(res.data().content);
          }
          sub.unsubscribe();
        });
      }
    });
  }

  ngAfterViewInit() {
    const edit = this.media.nativeElement;
    this.editor = new MediumEditor(edit);

    this.editor.subscribe('editableInput', (event, editable) => {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, edit]);

      if (this.user && event.target.innerHTML) {
        const contentRef = this.afStore.doc(`content/${this.user.uid}`);
        contentRef.set({content: event.target.innerHTML}, {merge: true});
      }
    });
  }
}
