import CreateOptions from '../dto/create.dto.js';
import * as print from 'lib/print-helper.js';
import { run, OutputType } from 'lib/command-helper.js';

export async function openOrg(): Promise<void> {
  const org = new OrgOpener();
  await org.open();
}

class OrgOpener {
  public async open(): Promise<void> {
    print.subheader('Opening Scratch Org');

    await run({
      cmd: 'sf org:open',
      args: ['--target-org', CreateOptions.scratchOrgName],
      outputType: OutputType.Spinner,
      spinnerText: 'Opened Org Successfully',
    });
  }
}
