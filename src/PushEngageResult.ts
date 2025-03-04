export enum PushEngageResultStatus {
  Success = 'success',
  Failure = 'failure',
}

export interface PushEngageResult<T> {
  data?: T;
  error?: string;
  status: PushEngageResultStatus;
}

export function success<T>(data: T): PushEngageResult<T> {
  return {
    data,
    status: PushEngageResultStatus.Success,
  };
}

export function failure<T>(error: string): PushEngageResult<T> {
  return {
    error,
    status: PushEngageResultStatus.Failure,
  };
}
