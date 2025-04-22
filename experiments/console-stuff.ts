import { UtilsTerminal } from 'tnp-core/lib';

const choices = {
  t1: {
    name: 't1',
  },
  t2: {
    name: 't2',
    disabled: true
  },
  t3: {
    name: 't3',
  },
  t4: {
    name: 't4',
  },
  t5: {
    name: 't5',
  },

};

// const value = await UtilsTerminal.select<keyof typeof choices>({
//   choices,
//   question: 'Select something',
// });
// console.log('Selected value:', value);
const value2 = await UtilsTerminal.multiselect<keyof typeof choices>({
  choices,
  question: 'Multiselect something something',
});
console.log('Multiselect value:', value2);

