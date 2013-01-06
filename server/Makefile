# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert
# Copyright (C) 2012, 2013 Sébastien Boisvert

CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe -std=c++98
#CXXFLAGS=-O0 -g -D CONFIG_ASSERT -Wall -std=c++98

TARGETS=RayCloudBrowser.commandLineClient RayCloudBrowser.createGraphDatabase RayCloudBrowser.getSubgraphWithPath \
	RayCloudBrowser.webServer.cgi RayCloudBrowser.createPathDatabase RayCloudBrowser.probePath \
	RayCloudBrowser.readJSON

LIBRARY_OBJECTS=GraphDatabase.o VertexObject.o Mapper.o PathDatabase.o JSONParser.o

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS)

RayCloudBrowser.webServer.cgi: webServer_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@
	chmod g-w $@
	chmod o-w $@

RayCloudBrowser.commandLineClient: commandLineClient_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.readJSON: readJSON_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.createGraphDatabase: createGraphDatabase_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.getSubgraphWithPath: getSubgraphWithPath_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.createPathDatabase: createPathDatabase_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.probePath: probePath_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	rm -f *.o $(TARGETS)

check: test-first test-store test-not-found

test-store:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=CATGAAAACGGGTTTTCCCATATTGACGCTA" ./RayCloudBrowser.webServer.cgi

test-first:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE" ./RayCloudBrowser.webServer.cgi

test-not-found:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=fdfddfjdsfdjsclkk" ./RayCloudBrowser.webServer.cgi

path-index:
	./RayCloudBrowser.createPathDatabase ~/Ray-Cloud-Browser-data/Contigs.fasta ~/Ray-Cloud-Browser-data/Contigs.fasta.dat

graph-index:
	./RayCloudBrowser.createGraphDatabase ~/Ray-Cloud-Browser-data/kmers.txt.sorted ~/Ray-Cloud-Browser-data/kmers.txt.dat

debug-path:
	./RayCloudBrowser.probePath debug  Contigs.fasta.dat|less

test-json:
	./RayCloudBrowser.readJSON  test.json
