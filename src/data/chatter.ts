import type { CrewId } from './crew'

export interface ChatterLine {
  crew: CrewId
  text: string
}

export interface ChatterScene {
  id: string
  lines: ChatterLine[]
}

/**
 * The boardroom is never quiet. These are arguments already in progress:
 * entering the room starts a scene a few lines in, so the first thing the user
 * hears is the middle of somebody's complaint about somebody else.
 */
export const BICKER_SCENES: ChatterScene[] = [
  {
    id: 'airlock',
    lines: [
      {
        crew: 'stack',
        text: "Look, the client said 'make it feel like the moon.' I delivered. The airlock was a metaphor that got out of hand.",
      },
      {
        crew: 'vera',
        text: 'It sealed during the fire drill. For forty minutes. I have the incident report in triplicate.',
      },
      {
        crew: 'equalizer',
        text: "Fourteen employees, one lawsuit, and a moon rock made of foam. I billed the foam as a 'structural asset.'",
      },
      {
        crew: 'catalyst',
        text: 'That was the highest engagement our newsletter has ever had. People love a hostage situation with snacks.',
      },
      { crew: 'rex', text: 'Dad says we are not allowed to build any more metaphors with doors.' },
      { crew: 'chip', text: "I still have the key. I'm not giving it back." },
    ],
  },
  {
    id: 'sandwich',
    lines: [
      {
        crew: 'milo',
        text: "Somebody put a sticky note on my sandwich that said 'PROPERTY OF R&D' and then ate my sandwich. That is two crimes and one bad font.",
      },
      {
        crew: 'chip',
        text: 'It was in the communal fridge. Communal means communist. I was raised better than this.',
      },
      { crew: 'nia', text: 'I rolled a natural twenty on perception. It was Dave. He was crying a little.' },
      {
        crew: 'stack',
        text: 'It was a very good sandwich. I was having a bad Tuesday. The sandwich understood me.',
      },
      {
        crew: 'wren',
        text: 'You owe Jerry nine dollars, a written apology, and a replacement sandwich with the crusts cut off.',
      },
      { crew: 'milo', text: "I don't want the sandwich. I want the note framed in the lobby." },
    ],
  },
  {
    id: 'crm',
    lines: [
      {
        crew: 'wren',
        text: "The CRM sent a 'rise and grind' email to a client who passed away in 2019. It has now sent it four times.",
      },
      {
        crew: 'xortron',
        text: 'Technically the automation is working exactly as designed. The design is the problem.',
      },
      {
        crew: 'theo',
        text: 'I wrote that subject line. I have to live with the knowledge that Gerald never rose or ground.',
      },
      {
        crew: 'equalizer',
        text: "Gerald's estate has questions. I have answers, but they cost more than the CRM.",
      },
      {
        crew: 'catalyst',
        text: "Can we reframe it as a legacy engagement touchpoint? No? Okay. I'll get my coat.",
      },
    ],
  },
  {
    id: 'budget-boss',
    lines: [
      { crew: 'chip', text: 'I beat the new build at lunch. The final boss is a spreadsheet with teeth.' },
      { crew: 'milo', text: "That's the budgeting tool." },
      { crew: 'chip', text: 'Then why is it fun?' },
      { crew: 'rex', text: "Dad wants to know why the budgeting tool has a final boss and why it's him." },
      { crew: 'nia', text: 'Because the dungeon needs a villain. Also he has the best loot.' },
      { crew: 'stack', text: 'The spreadsheet has better collision detection than the actual game.' },
    ],
  },
  {
    id: 'hot-tub',
    lines: [
      { crew: 'ines', text: 'Someone used my acoustic hot tub as a coffee machine.' },
      { crew: 'stack', text: 'It had a spout.' },
      {
        crew: 'ines',
        text: 'It has a JET. You made espresso in a jet. There was foam on the ceiling for three days.',
      },
      { crew: 'vera', text: 'I tested the coffee. It failed on the third sip and the fourth apology.' },
      {
        crew: 'catalyst',
        text: "I put 'wellness beverage program' in the deck. Nobody asked a follow-up. That's how you know it's working.",
      },
      { crew: 'wren', text: "There's a man in the lobby asking why the elevator smells like hazelnut." },
    ],
  },
  {
    id: 'pigeon',
    lines: [
      { crew: 'nia', text: "The pigeon is back. He's in the server room. He has a name tag now." },
      {
        crew: 'sable',
        text: "I named him. He's been on the payroll since March. His name is Gerald too.",
      },
      {
        crew: 'equalizer',
        text: "He's not on the payroll. He's on the org chart. There is a difference and it is billable.",
      },
      { crew: 'wren', text: 'He has more equity than I do and he eats from the trash.' },
      { crew: 'xortron', text: 'The pigeon is the only employee who has never lied to me.' },
      { crew: 'chip', text: "He's also the only one who's ever beaten me at Street Fighter." },
    ],
  },
  {
    id: 'vending',
    lines: [
      { crew: 'milo', text: 'Who installed a vending machine that only accepts arcade tokens?' },
      { crew: 'chip', text: "That was me. It's called an economy. You wouldn't understand." },
      {
        crew: 'catalyst',
        text: "I put it in the pitch deck as a 'captive loyalty loop.' The investors loved it.",
      },
      { crew: 'vera', text: 'It ate my dollar and gave me a keychain that says ERROR.' },
      { crew: 'stack', text: "That keychain is a collector's item. I have four and I'm not selling." },
      { crew: 'rex', text: 'Dad says the vending machine makes more money than the company.' },
    ],
  },
  {
    id: 'thread',
    lines: [
      {
        crew: 'sable',
        text: 'I found the 2014 thread again. The guy who solved it is now a wedding DJ in Tampa.',
      },
      { crew: 'theo', text: 'Did you email him?' },
      {
        crew: 'sable',
        text: "He replied 'wrong number' and then sent me his mixtape. It's the best research I've done all year.",
      },
      {
        crew: 'ines',
        text: "Play it. If it's got a saxophone, I can score the whole quarter to it.",
      },
      {
        crew: 'equalizer',
        text: 'You cannot use an unsolicited mixtape as company IP. I read the terms. All of them.',
      },
    ],
  },
  {
    id: 'mural',
    lines: [
      { crew: 'catalyst', text: "Who painted a mural of my face over the fire exit?" },
      { crew: 'stack', text: "You said 'make the brand impossible to ignore.'" },
      { crew: 'rex', text: "The fire marshal said it's the most recognizable obstruction he's ever seen." },
      { crew: 'wren', text: "We had to label it 'art' so the insurance would cover the door." },
      {
        crew: 'nia',
        text: "The eyes follow you. Not in a spooky way. In a 'please buy something' way.",
      },
      { crew: 'ines', text: "I wrote a jingle for it. It's just your name sixteen times and a gong." },
    ],
  },
  {
    id: 'printer',
    lines: [
      {
        crew: 'wren',
        text: 'The printer jammed again. It only jams on Fridays, and only when Jerry prints his timesheet.',
      },
      { crew: 'milo', text: 'I print my timesheet on Friday because that is when the week ends.' },
      {
        crew: 'chip',
        text: "The printer is not jammed. It's staging a protest. I respect it.",
      },
      {
        crew: 'vera',
        text: 'I reproduced the jam eleven times. The eleventh time it printed a picture of Dave.',
      },
      { crew: 'stack', text: 'I was having a bad Tuesday. The printer understood me.' },
      { crew: 'theo', text: 'Nobody is going to believe any of this in the incident report.' },
      {
        crew: 'equalizer',
        text: "The printer has requested legal representation. I'm taking the case.",
      },
    ],
  },
]

export function pickBickerScene(exceptId?: string): ChatterScene {
  const pool = BICKER_SCENES.filter((scene) => scene.id !== exceptId)
  const choices = pool.length > 0 ? pool : BICKER_SCENES
  return choices[Math.floor(Math.random() * choices.length)] ?? BICKER_SCENES[0]
}
