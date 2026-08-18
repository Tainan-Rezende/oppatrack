import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  public currentUser = signal<User | null>(null);
  public currentProfile = signal<UserProfile | null>(null);
  public isLoading = signal<boolean>(true);
  public isLoginModalOpen = signal<boolean>(false);

  private readonly supabaseUrl = 'https://fvkieynhmefonjrsocll.supabase.co';
  private readonly supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a2lleW5obWVmb25qcnNvY2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODUxMjcsImV4cCI6MjEwMjQ2MTEyN30.lz3oDUxQbLKS-PVAwlxUc4n9YkXPvrOpdlx3wAHVkUY';

  constructor(private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
    this.initAuth();
  }

  public getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  public openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  public closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  public async waitForAuth(): Promise<void> {
    if (!this.isLoading()) return;

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!this.isLoading()) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }

  private async initAuth(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      if (data?.session?.user) {
        this.currentUser.set(data.session.user);
        await this.fetchProfile(data.session.user.id);
      }
    } catch (err) {
      console.error('Erro ao restaurar sessão:', err);
    } finally {
      this.isLoading.set(false);
    }

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        this.currentUser.set(session.user);
        await this.fetchProfile(session.user.id);
      } else {
        this.currentUser.set(null);
        this.currentProfile.set(null);
      }
      this.isLoading.set(false);
    });
  }

  public async fetchProfile(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      this.currentProfile.set(data as UserProfile);
    }
  }

  public async register(name: string, email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: { username: name.trim() },
      },
    });

    if (error) throw error;
    if (data.user) {
      await this.fetchProfile(data.user.id);
    }
  }

  public async login(identifier: string, password: string): Promise<void> {
    const supabase = this.getSupabaseClient();
    let emailToUse = identifier;

    if (!identifier.includes('@')) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', identifier.trim())
        .maybeSingle();

      if (error || !data) {
        throw new Error('E-mail, apelido ou senha incorretos.');
      }

      emailToUse = data.email;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (authError) throw authError;
  }

  public async recoverPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account/dashboard`,
    });
    if (error) throw error;
  }

  public async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.router.navigate(['/home']);
  }
}