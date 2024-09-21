import express from 'express';
import { Participant } from './frost/participant.js';
import { Point } from './frost/point.js';


const app = express();
app.use(express.json());

const participantId = parseInt(process.argv[2], 10);
if (isNaN(participantId)) {
  console.error('Please provide a valid participant ID');
  process.exit(1);
}

const PORT = 3000 + participantId;
let participant: Participant;

app.post('/init', (req, res) => {

  const { index, threshold, totalParticipants } = req.body;
  participant = new Participant(index, threshold, totalParticipants);
  participant.initKeygen();
  participant.generateShares();
  
  res.json({
    coefficientCommitments: participant.coefficientCommitments!.map(c => c.secSerialize().toString('hex')),
    shares: participant.shares ? participant.shares.map(share => share.toString()) : null,
  });
  console.log(`Participant ${index} initialized`);
  
});

app.post('/aggregate-shares', (req, res) => {
  const { shares, coefficientCommitments } = req.body;
  participant.aggregateShares(shares);
  participant.derivePublicKey(coefficientCommitments.map((c: string) => Point.secDeserialize(c).x));
  console.log(`uggggggggggbuggggggggggg+1`);
  participant.deriveGroupCommitments(coefficientCommitments.map((cc: string[]) => cc.map((c: string) => Point.secDeserialize(c))));

  res.json({ message: 'Shares aggregated' });
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: participant.publicKey!.secSerialize().toString('hex') });
});

app.post('/generate-nonces', (req, res) => {
  const { rounds } = req.body;
  const nonceCommitments = [];
  for (let i = 0; i < rounds; i++) {
    participant.generateNoncePair();
    nonceCommitments.push(participant.nonceCommitmentPair!.map(p => p.secSerialize().toString('hex')));
  }
  res.json({ nonceCommitments });
});

app.post('/sign', (req, res) => {
  const { message, nonceCommitmentPairs, participantIndexes } = req.body;
  console.log( "message, nonceCommitmentPairs, participantIndexes" , message.data.toString('hex'));
  const signature = participant.sign(
    message.data.toString('hex'),
    nonceCommitmentPairs.map((pair: string[]) => pair.map((p: string) => Point.secDeserialize(p))),
    participantIndexes
  );
  res.json({ signature : signature.toString(16) });
});

app.listen(PORT, () => {
  console.log(`Participant ${participantId} running on http://localhost:${PORT}`);
});