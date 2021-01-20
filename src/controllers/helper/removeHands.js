const RemoveHands = async (students) => {
  return students.map((student) => (student.handRaised = false));
};

export default RemoveHands;
