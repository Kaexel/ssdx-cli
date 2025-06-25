import notifier from 'node-notifier';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NotificationOptions {
  title: string;
  message: string;
  sound?: boolean;
  wait?: boolean;
}

// TODO: enforce notification disabling

export class Notification {
  private static getIcon(): string {
    return join(__dirname, 'assets', 'salesforce.png');
  }

  static async show(options: NotificationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      notifier.notify(
        {
          title: `[SSDX] ${options.title}`,
          message: options.message,
          icon: undefined,
          contentImage: this.getIcon(),
          sound: options.sound ?? false,
          wait: options.wait ?? false,
        },
        error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async showInfo(message: string, title: string = 'Info'): Promise<void> {
    return this.show({
      title,
      message,
    });
  }

  static async showSuccess(message: string, title: string = 'Success'): Promise<void> {
    return this.show({
      title,
      message,
      sound: false,
    });
  }

  static async showWarning(message: string, title: string = 'Warning'): Promise<void> {
    return this.show({
      title,
      message,
      sound: false,
    });
  }

  static async showError(message: string, title: string = 'Error'): Promise<void> {
    return this.show({
      title,
      message,
      sound: true,
      wait: true,
    });
  }
}
