import { Ora } from 'ora';

export function handleProcessSignals(spinner?: Ora) {
  const handleSignal = () => {
    if (spinner) {
      spinner.suffixText = '[ABORTED BY USER]';
      spinner.fail();
    }
    process.exit(0);
  };

  process.on('SIGINT', () => handleSignal());
  process.on('SIGTERM', () => handleSignal());
}
