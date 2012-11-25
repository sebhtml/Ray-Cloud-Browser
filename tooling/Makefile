CXX=g++

test:
	./Get-Sub-Graph-With-Path kmers.txt RaySeed-7000015.fasta 16 CustomSource.json

t1000:
	./Get-Sub-Graph-With-Path kmers.txt 1000.fasta 1 1000.fasta.json


small:
	./Get-Sub-Graph-With-Path kmers.txt.10000 1000.fasta 16 1000.fasta.json

tiny:
	./Get-Sub-Graph-With-Path kmers.txt.tiny 1000.fasta 16 1000.fasta.json

creator:
	$(CXX) CreateGraphDatabase.cpp -O3 -Wall -march=native -pipe -o CreateGraphDatabase
