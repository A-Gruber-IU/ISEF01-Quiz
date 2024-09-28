const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

exports.updateQuestionIndices = functions.firestore
  .document('courses/{courseId}/questions/{questionId}')
  .onWrite(async (change, context) => {
    const { courseId, questionId } = context.params;

    // Get the new and previous question data
    const newQuestion = change.after.exists ? change.after.data() : null;
    const oldQuestion = change.before.exists ? change.before.data() : null;

    // Determine the action (create, update, delete)
    let action;
    if (!oldQuestion && newQuestion) action = 'create';
    else if (oldQuestion && !newQuestion) action = 'delete';
    else if (oldQuestion && newQuestion) action = 'update';
    else return null; // No action needed

    // Get the current indices
    const submittedIndexRef = firestore.doc(`courses/${courseId}/questions/index_submitted`);
    const reviewedIndexRef = firestore.doc(`courses/${courseId}/questions/index_reviewed`);

    const submittedIndex = (await submittedIndexRef.get()).data() || { questionIds: [] };
    const reviewedIndex = (await reviewedIndexRef.get()).data() || { questionIds: [] };

    // Update indices based on the action and question status
    if (action === 'create' || action === 'update') {
      const status = newQuestion.status;
      if (status === 'submitted') {
        if (!submittedIndex.questionIds.includes(questionId)) {
          submittedIndex.questionIds.push(questionId);
        }
        reviewedIndex.questionIds = reviewedIndex.questionIds.filter(id => id !== questionId);
      } else if (status === 'reviewed') {
        if (!reviewedIndex.questionIds.includes(questionId)) {
          reviewedIndex.questionIds.push(questionId);
        }
        submittedIndex.questionIds = submittedIndex.questionIds.filter(id => id !== questionId);
      }
    } else if (action === 'delete') {
      submittedIndex.questionIds = submittedIndex.questionIds.filter(id => id !== questionId);
      reviewedIndex.questionIds = reviewedIndex.questionIds.filter(id => id !== questionId);
    }

    // Write the updated indices back to Firestore
    await submittedIndexRef.set(submittedIndex);
    await reviewedIndexRef.set(reviewedIndex);

    return null;
  });

