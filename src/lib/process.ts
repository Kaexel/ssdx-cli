import { Ora } from 'ora';

export function handleProcessSignals(spinner?: Ora) {
  const handleSignal = () => {
    // Check if we've already handled this signal
    if (process.exitCode !== undefined) {
      return; // Another handler already initiated exit
    }

    if (spinner && !spinner.isSpinning) {
      return; // Spinner already stopped
    }

    if (spinner) {
      spinner.suffixText = '[ABORTED BY USER]';
      spinner.fail();
    }

    // Use process.exitCode instead of process.exit() for more graceful shutdown
    process.exitCode = 0;

    // Allow other cleanup to happen
    setImmediate(() => process.exit(0));
  };

  process.on('SIGINT', () => handleSignal());
  process.on('SIGTERM', () => handleSignal());
}
