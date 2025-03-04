export interface Mappable {
  toMap(): Record<string, any>;
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

  toMap(): Record<string, any> {
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
