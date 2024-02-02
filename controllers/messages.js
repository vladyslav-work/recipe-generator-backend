import Message from "../models/messages.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import Interview from "../models/interviews.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/api/records"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.${file.originalname.split(".").pop()}`);
  },
});

export const upload = multer({ storage: storage });

export const nextQuestion = async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId) {
    return res.status(400).json({
      success: false,
      message: "Interview id is required",
      answer: null,
      question: null,
    });
  }
  if (!req.file) {
    return res.status(400).send({
      success: false,
      message: "No answer uploaded",
      answer: null,
      question: null,
    });
  }
  const recordPath = req.file.path
    .replace(/\\/g, "/")
    .split("/")
    .shift()
    .join("/");
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).send({
        success: false,
        message: "Interview id is not valid",
        answer: null,
        question: null,
      });
    if (interview > 2)
      return res.status(400).send({
        success: false,
        message: "Interview was already finished",
        answer: null,
        question: null,
      });
    if (interview < 2) {
      interview.status = 2;
      await interview.save();
    }
    const content = getTranscription(recordPath);
    const message = await new Message({
      interview: interviewId,
      content,
      role: 0,
      record: recordPath,
    }).save();
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      answer: null,
      question: null,
    });
  }
};

export const changeAnswer = async (req, res) => {};

export const reAnswer = async (req, res) => {};

export const deleteMessages = async (req, res) => {};
