const RemoveHands = async (students) => {
  for (let student of students) {
    console.log(student);
    student.handRaised = false;
  }
};

export default RemoveHands;
