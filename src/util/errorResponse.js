/* @desc: This class extends Error to both contain an http error status code and end user message.
 * @param: "statusCode", refers to an http error code.  "message", refers to an a legible message explaining to user the error.
 * @returns: a new instance of ErrorResponse.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
  }
}

/* @desc: A helper function that displays all messages as an array.
 */
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Build your resulting errors however you want! String, object, whatever - it works!
  return [`${msg}`];
};

const errorHandler = (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.log(err);

  if (err.name === "CastError") {
    res.status(404).json({ error: "Invalid Object Id." });
  }

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err.message });
};
const _ErrorResponse = ErrorResponse;
export { errorHandler };
export { _ErrorResponse as ErrorResponse };
export const errorFormater = errorFormatter;
