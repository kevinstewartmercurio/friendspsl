/* 
cron tasks:
    - update roster spreadsheets
    - pull 
*/

import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).end("Running cron job...")
}