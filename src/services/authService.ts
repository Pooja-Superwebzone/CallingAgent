// src/services/authService.ts
import { AuthResponse } from '../types/auth';

const API_URL = 'https://n8n.srv799538.hstgr.cloud/webhook/19e1543a-2f0b-4314-9365-f4767329cebc';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo';


export class MyAuthService {

    //export async function login(email: string, password: string): Promise<AuthResponse> {
    static async login(email: string, password: string){
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const res = await response.json();
      console.log(res);
      //console.log(res[0].status);
      if(res[0].status == 'success'){
        localStorage.setItem('cu', JSON.stringify(res[0].data));
        localStorage.setItem('isauthenticated','true');
        localStorage.setItem('token',res[0].jwt_token);
        localStorage.setItem('set',res[0].session_endtime);
        localStorage.setItem('sid',res[0].session_id);
        return res[0].data;
      } else {
        return null;
      }  
      //return data as AuthResponse;
    }

    static isLoggedin(){
      const isAuth = localStorage.getItem('isauthenticated');
      return isAuth ? isAuth : null;
    }
    static getCurrentUser(){
        const userData = localStorage.getItem('cu');
        return userData ? JSON.parse(userData) : null;
    }
    static logout(){
      //localStorage.removeItem('isauthenticated');
      //localStorage.removeItem('currentUser');
      localStorage.clear();
    }
    static getToken(){
      const token = localStorage.getItem('token');
      return token ? token : null;
    }
    static getSessionId(){
      const sid = localStorage.getItem('sid');
      return sid ? sid : null;
    }
    static getSessionTime(){
      const set = localStorage.getItem('set');
      return set ? set : null;
    }
}
