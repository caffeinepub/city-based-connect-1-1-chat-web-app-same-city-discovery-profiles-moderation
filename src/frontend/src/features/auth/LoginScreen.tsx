import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Pressable } from '../shared/motion/Pressable';
import { AmbientSparkles } from '../shared/motion/AmbientSparkles';

export function LoginScreen() {
  const { login, isLoggingIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <AmbientSparkles />
      
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="space-y-4">
            <div className="animate-avatar-entrance">
              <img
                src="/assets/generated/app-icon.dim_1024x1024.png"
                alt="App Icon"
                className="mx-auto h-24 w-24 rounded-3xl shadow-lg glow-soft"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Connect Locally
            </h1>
            <p className="text-base text-muted-foreground">
              Meet and chat with people in your city
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Pressable>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full rounded-full text-base font-medium glow-soft"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in to get started'}
              </Button>
            </Pressable>
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to connect with others in your area
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/80 backdrop-blur-sm px-6 py-4 text-center text-xs text-muted-foreground relative z-10">
        <p>
          © {new Date().getFullYear()} • Built with{' '}
          <Heart className="inline h-3 w-3 fill-primary text-primary" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
