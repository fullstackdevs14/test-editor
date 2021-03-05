import { Injectable } from '@angular/core';
import { User } from '../services/user';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData = new BehaviorSubject(null);

  constructor(
    public afStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData.next(user);
        localStorage.setItem('user', JSON.stringify(user));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user;
  }

  loginWithGoogle() {
    return this.googleLogin(new firebase.auth.GoogleAuthProvider());
  }

  googleLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
      this.setUserData(result.user).then(() => {
        this.router.navigate(['dashboard']);
      });
    }).catch((error) => {
      window.alert(error);
    });
  }

  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }

}
