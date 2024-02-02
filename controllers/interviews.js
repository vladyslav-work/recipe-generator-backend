import Interview from "../models/interviews.js";
import { createThread, getSpeech } from "../utils/utils.js";
import Message from "../models/messages.js";

export const getInformation = async (req, res) => {
  const { interviewId } = req.query;
  if (!interviewId)
    return res.status(400).json({ error: "Interview id is required" });
  let responseTemplate = {
    interviewSessionSummary: null,
    author: null,
    interviewScript: null,
    severityScoreSummary: null,
  };

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).json({ error: "Interview id is not valid" });
    const messages = await Message.find({ interview: interviewId });
    responseTemplate.interviewSessionSummary = {
      totalTimeDuration: interview.totalDuration,
      amountOfAnswers: Math.round(messages.length / 2),
      wordCount: interview.totalWords,
      questionOrTopic: interview.question,
    };
    responseTemplate.author = {
      firstName: interview.firstName,
      lastName: interview.lastName,
      title: interview.title,
      company: interview.company,
      linkedinProfileIdentifier: interview.linkedin,
    };
    let interviewScript = [];
    let answerCount = 1,
      indexOfMessages = 0,
      sumOfDuration = 0,
      durationOfConversation = 0;
    let disasters = { low: 0, mid: 0, high: 0 },
      healthIssues = { low: 0, mid: 0, high: 0 };
    const conversationTemplate = {
      answerNumber: answerCount,
      interviewerQuestion: null,
      interviewerAudioFileLink: null,
      expertAnswer: null,
      expertAudioFileLink: null,
      audioTimeDuration: null,
      wordsCount: 0,
    };
    let conversation = { ...conversationTemplate };
    while (true) {
      if (indexOfMessages >= messages.length) break;
      const message = messages[indexOfMessages];
      // ---------- conversation ----------
      if (message.role === 1) {
        if (conversation.interviewerQuestion || conversation.expertAnswer) {
          conversation.audioTimeDuration = [
            sumOfDuration,
            sumOfDuration + durationOfConversation,
          ];
          interviewScript.push(conversation);
          conversation = { ...conversationTemplate };
          answerCount += 1;
          sumOfDuration += durationOfConversation;
          durationOfConversation = 0;
        }
        conversation.answerNumber = answerCount;
        conversation.interviewerQuestion = message.content;
        conversation.interviewerAudioFileLink = message.record;
        durationOfConversation = message.duration;
      } else {
        conversation.expertAnswer = message.content;
        conversation.expertAudioFileLink = message.record;
        durationOfConversation += message.duration;
      }
      // ---------- summary ---------------
      disasters = {
        low: disasters.low + message.disasters.low,
        mid: disasters.mid + message.disasters.mid,
        high: disasters.high + message.disasters.high,
      };

      healthIssues = {
        low: healthIssues.low + message.healthIssues.low,
        mid: healthIssues.mid + message.healthIssues.mid,
        high: healthIssues.high + message.healthIssues.high,
      };
    }
    if (conversation.interviewerQuestion || conversation.expertAnswer) {
      conversation.audioTimeDuration = [
        sumOfDuration,
        sumOfDuration + durationOfConversation,
      ];
      interviewScript.push(conversation);
    }
    responseTemplate.interviewScript = interviewScript;
    responseTemplate.severityScoreSummary = {
      disasters: {
        low: disasters.low / messages.length,
        mid: disasters.mid / messages.length,
        high: disasters.high / messages.length,
      },
      healthIssues: {
        low: healthIssues.low / messages.length,
        mid: healthIssues.mid / messages.length,
        high: healthIssues.high / messages.length,
      },
    };
    return res.json(responseTemplate);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal server error, Please try again" });
  }
};

export const getStatus = async (req, res) => {
  const { interviewId: paramsInterviewId } = req.params;
  const { interviewId: queryInterviewId } = req.query;
  const interviewId = paramsInterviewId || queryInterviewId;
  if (!interviewId)
    return res.status(400).json({ error: "Interview id is required" });
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).json({ error: "Interview id is not valid" });
    const statusString = [
      "Created",
      "Opened",
      "Interviewing",
      "Done",
      "Failed",
    ];
    return res.json({
      success: true,
      sessionId: interviewId,
      status: statusString[interview.status],
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      sessionId: interviewId,
      status: null,
    });
  }
};

export const createSession = async (req, res) => {
  const { expertDetails, interviewDetails } = req.body;
  const {
    name,
    title,
    company,
    linkedinProfile: linkedin,
  } = expertDetails || {};
  const { questionOrTopic: question } = interviewDetails || {};

  const sessionCreationFailedResponse = {
    success: false,
    message: "Interview session creation failed!",
    sessionUrl: null,
  };

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Expert's name is required",
      sessionUrl: null,
    });
  }

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Expert's title is required",
      sessionUrl: null,
    });
  }

  if (!company) {
    return res.status(400).json({
      success: false,
      message: "Expert's company is required",
      sessionUrl: null,
    });
  }

  if (!question) {
    return res.status(400).json({
      success: false,
      message: "Main topic of the interview is required",
      sessionUrl: null,
    });
  }

  if (!linkedin) {
    return res.status(400).json({
      success: false,
      message: "Expert's LinkedIn is required",
      sessionUrl: null,
    });
  }

  try {
    const { thread, messages } = await createThread(
      name,
      title,
      company,
      question
    );

    if (!thread || !messages || messages.length < 1) {
      return res.status(500).json(sessionCreationFailedResponse);
    }

    const interview = await new Interview({
      name,
      title,
      question,
      linkedin,
      company,
      threadId: thread.id,
    }).save();

    const introduction = messages[0];

    const content = introduction.content.reduce(
      (acc, answer) => acc + answer.text.value,
      ""
    );

    const record = await getSpeech(content);
    if (!record) {
      return res.status(500).json(sessionCreationFailedResponse);
    }

    await new Message({
      content,
      interview: interview._id,
      role: 1,
      record,
    }).save();

    return res.status(200).json({
      success: true,
      message: "Interview session created successfully.",
      sessionUrl: `/interview-sessions/${interview._id}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(sessionCreationFailedResponse);
  }
};

export const openSession = async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId)
    return res.status(400).json({
      success: false,
      message: "Interview id is required",
    });
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).json({
        success: false,
        message: "Interview id is not valid",
      });
    if (interview.status === 0) {
      interview.status = 1;
      await interview.save();
      return res.json({
        success: true,
        message: "Interview opened successfully",
      });
    } else {
      return res.json({
        success: true,
        message: "Interview was already opened",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!",
    });
  }
};

export const finishSession = async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId)
    return res.status(400).json({
      success: false,
      message: "Interview id is required",
    });
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).json({
        success: false,
        message: "Interview id is not valid",
      });
    if (interview.status < 3) {
      interview.status = 3;
      await interview.save();
      return res.json({
        success: true,
        message: "Interview finished successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Interview was already finished",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again!",
    });
  }
};

export const restartSession = async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId) {
    return res.status(400).json({
      success: false,
      message: "Interview id is required",
    });
  }
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(400).json({
        success: false,
        message: "Interview id is not valid",
      });
    interview.status = 1
    await interview.save()
    // selete messages
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again",
    });
  }
};

export const deleteSessions = async (req, res) => {
  const { ids } = req.params;
  if (!ids) {
    return res.status(400).json({
      success: false,
      message: "Interview id is required",
    });
  }
  try {
    const { n } = await Interview.deleteMany({ _id: { $in: ids.split(",") } });
    if (n === 0)
      return res.json({
        success: false,
        message: `There is no interivew sessions matched those ids`,
      });
    return res.json({
      success: true,
      message: `${n} interview${n > 1 ? "s" : ""} is deleted succesfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again",
    });
  }
};
