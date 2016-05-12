
f = open('selfmatches.txt')

qidDict = {} #Dictionary to match qids to qgenomes
matches = [] #list of all results

for line in f:
	if line.startswith('# Query'):
		parsedline = line.split(" ")
		qid = parsedline[2]
		qgenome = parsedline[3]
		qidDict[qid] = qgenome
	if not(line.startswith('#')):	
		aMatch = {}
		parsedline = line.split("\t")
		if (parsedline[0] != parsedline[1]):
			aMatch["qid"] = parsedline[0]
			aMatch["sid"] = parsedline[1]
			aMatch["percid"] = parsedline[2]
			aMatch["evalue"] = parsedline[10]
			aMatch["score"] = parsedline[11].replace("\n", "")
			aMatch["qgenome"] = qgenome
			matches.append(aMatch)
			
for match in matches:
	sid = match["sid"]
	sgenome = qidDict[sid]
	match["sgenome"] = sgenome

for i in range(0,100):
	if(matches[i]["qid"] == matches[i]["sid"]):
		print("uh oh")

