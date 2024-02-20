export const hasFingerprint = (req, res, next) => {
  if (req.cookies.fingerprint && req.cookies.fingerprint.trim() !== "") {
    req.fingerprint = req.cookies.fingerprint;
    next();
  } else {
    res.status(401).json({ message: "Fingerprint is required" });
  }
};
