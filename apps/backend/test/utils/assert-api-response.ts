import { ApiResponse } from '../../src/infrastructure/common/types/api-response.type';

export function assertApiResponse(body: unknown): asserts body is ApiResponse {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Response body must be an object');
  }

  if (!('success' in body)) {
    throw new Error("Response body is missing 'success' property");
  }

  if (!('timestamp' in body)) {
    throw new Error("Response body is missing 'timestamp' property");
  }

  const typedBody = body as { success: boolean };

  if (!typedBody.success) {
    if (!('errorCode' in body))
      throw new Error("Error response missing 'errorCode'");
    if (!('statusCode' in body))
      throw new Error("Error response missing 'statusCode'");
    if (!('message' in body))
      throw new Error("Error response missing 'message'");
  } else {
    if (!('data' in body)) throw new Error("Success response missing 'data'");
  }
}
