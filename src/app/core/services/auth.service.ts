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

  private readonly supabaseUrl = 'https://fvkieynhmefonjrsocll.supabase.co';
  private readonly supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a2lleW5obWVmb25qcnNvY2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODUxMjcsImV4cCI6MjEwMjQ2MTEyN30.lz3oDUxQbLKS-PVAwlxUc4n9YkXPvrOpdlx3wAHVkUY';

  constructor(private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
    this.initAuth();
  }

  // Getter para acesso ao cliente Supabase
  public getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  private async initAuth(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      this.currentUser.set(data.session.user);
      await this.fetchProfile(data.session.user.id);
    }
    this.isLoading.set(false);

    // Escuta mudanças de sessão em tempo real
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
      .single();

    if (data) {
      this.currentProfile.set(data as UserProfile);
    }
  }

  public async register(name: string, email: string, password: string): Promise<{ profileCode: string }> {
    const profileCode = `#OPPA-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          username: name.trim(),
          profile_code: profileCode,
        },
      },
    });

    if (error) throw error;
    if (data.user) {
      await this.fetchProfile(data.user.id);
    }

    return { profileCode };
  }

  public async login(identifier: string, password: string): Promise<void> {
    let resolvedEmail = identifier.trim();

    if (!resolvedEmail.includes('@')) {
      const formattedCode = resolvedEmail.startsWith('#')
        ? resolvedEmail.toUpperCase()
        : `#${resolvedEmail.toUpperCase()}`;

      const { data, error } = await this.supabase
        .from('profiles')
        .select('email')
        .eq('profile_code', formattedCode)
        .single();

      if (error || !data?.email) {
        throw new Error('Código de perfil não encontrado.');
      }

      resolvedEmail = data.email;
    }

    const { error } = await this.supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password: password,
    });

    if (error) throw error;
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