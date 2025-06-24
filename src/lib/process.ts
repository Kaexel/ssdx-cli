export function handleProcessSignals(spinner?: {
  fail: (message: string) => void;
}) {
  const handleSignal = () => {
    if (spinner) {
      spinner.fail('Operation cancelled by user');
    }
    process.exit(0);
  };

  process.on('SIGINT', () => handleSignal());
  process.on('SIGTERM', () => handleSignal());
}
