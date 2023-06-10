/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ErrorRequestHandler } from 'express';
import variable from '../../../config';
import ApiError from '../../../errors/apiError';
import validationErrorHandler from '../../../errors/validationErrorHandler';
import { IGenericErrorMessage } from '../../../interface/error.interface';
import { errorlogger } from '../../../shared/logger';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
	// variable.nodeENV === 'production'
	// 	? errorlogger.error(error)
	// 	: console.log(`Global error handler:::: ${error}`);
	errorlogger.error(error);

	let statusCode = 500;
	let message: string | null = 'something went wrong!';
	let errorMessage: IGenericErrorMessage[] = [];

	if (error?.name === 'ValidationError') {
		const validationError = validationErrorHandler(error);
		statusCode = validationError?.statusCode;
		message = validationError?.message;
		errorMessage = validationError?.errorMessage;
	} else if (error instanceof ApiError) {
		statusCode = error?.statusCode;
		message = error.message;
		errorMessage = error?.message
			? [
					{
						path: '',
						message: error?.message,
					},
			  ]
			: [];
	} else if (error instanceof Error) {
		message = error?.message;
		errorMessage = error?.message
			? [
					{
						path: '',
						message: error?.message,
					},
			  ]
			: [];
	}

	res.status(statusCode).json({
		status: false,
		message,
		errorMessage,
		stack: variable.nodeENV !== 'production' ? error?.stack : undefined,
	});

	next();
};

export default globalErrorHandler;
