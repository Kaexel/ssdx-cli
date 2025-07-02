import colors from 'colors/safe.js';
import { Color, frame, getFrameOptions, setColors } from './print-helper/print-helper-formatter.js';
import { logger } from './log.js';
import pad from 'pad';
import { Notification } from './notification.js';

export function header(
  text: string,
  subText: string | undefined = undefined,
  bgColor: Color = Color.bgYellow,
  color: Color = Color.black
): void {
  const frameOptions = getFrameOptions(text, subText);
  frameOptions.full_width = true;
  frameOptions.top = true;
  frameOptions.bottom = true;
  frameOptions.separator = '-';
  frameOptions.edge = '|';

  text = frame(frameOptions);
  text = colors.bold(colors.black(text));
  text = setColors(text, [color, bgColor]);
  output(text);
}

export function subheader(
  text: string,
  subText: string | undefined = undefined,
  bgColor: Color = Color.bgYellow,
  color: Color = Color.black
): void {
  const frameOptions = getFrameOptions(text, subText);
  frameOptions.half_width = true;
  frameOptions.top = true;
  frameOptions.bottom = true;
  frameOptions.separator = '-';
  frameOptions.edge = '|';

  text = frame(frameOptions);
  text = colors.bold(colors.black(text));
  text = setColors(text, [color, bgColor]);
  output(text);
}

export interface PrintOptions {
  output?: boolean;
  log?: boolean;
  notification?: boolean;
}

function printDebug(): boolean {
  return process.env.DEBUG === 'true';
}

export function debug(text: string, obj?: object): void {
  logger.info(obj, text);
  if (printDebug()) console.log(colors.yellow(text));
  if (printDebug()) console.log(obj);
}
export function info(text: string): void {
  logger.info(text);
  console.log(text);
}
export function output(text: string): void {
  console.log(text);
}
export function warning(text: string, options: PrintOptions = {}): void {
  const { output = true, log = true, notification = false } = options;
  if (log) logger.warn(text);
  if (notification) void Notification.showWarning(text);
  if (output) console.log(colors.yellow(text));
}
export function error(text: string, options: PrintOptions = {}): void {
  const { output = true, log = true, notification = true } = options;
  if (log) logger.error(text);
  if (notification) void Notification.showError(text);
  if (output) console.log(colors.bold(colors.red(text)));
}
export function code(text: string, options: PrintOptions = {}): void {
  const { output = true, log = true } = options;
  if (log) logger.info(text);
  if (output) console.log(colors.bgGreen(colors.black(text)));
}

// Notifications
export function notificationSuccess(text: string): void {
  void Notification.showSuccess(text);
}
export function notificationInfo(text: string): void {
  void Notification.showInfo(text);
}
export function notificationWarning(text: string): void {
  void Notification.showWarning(text);
}
export function notificationError(text: string): void {
  void Notification.showError(text);
}

export function printSeparator(): void {
  output(getSeparator());
}
export function getSeparator(): string {
  return pad('', process.stdout.columns, '-');
}
