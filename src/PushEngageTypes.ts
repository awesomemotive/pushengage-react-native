export interface Mappable {
  toMap(): Record<
    string,
    string | number | boolean | Record<string, string> | undefined
  >;
}

export class TriggerCampaign implements Mappable {
  campaignName: string;
  eventName: string;
  referenceId?: string;
  profileId?: string;
  data?: Record<string, string>;

  constructor({
    campaignName,
    eventName,
    referenceId,
    profileId,
    data,
  }: {
    campaignName: string;
    eventName: string;
    referenceId?: string;
    profileId?: string;
    data?: Record<string, string>;
  }) {
    this.campaignName = campaignName;
    this.eventName = eventName;
    this.referenceId = referenceId;
    this.profileId = profileId;
    this.data = data;
  }

  toMap(): Record<
    string,
    string | number | boolean | Record<string, string> | undefined
  > {
    return {
      campaignName: this.campaignName,
      eventName: this.eventName,
      referenceId: this.referenceId,
      profileId: this.profileId,
      data: this.data,
    };
  }
}

export enum TriggerStatusType {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

/**
 * Error class for PushEngage permission-related errors.
 */
export class PushEngagePermissionError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'PushEngagePermissionError';
  }
}
