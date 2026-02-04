// utils/responseHelper.js
import { NextResponse } from 'next/server';

export const sendJsonResponse = ({ success, status, message, data = null }) => {
  return NextResponse.json({
    success,
    status,
    message,
    data,
  });
};