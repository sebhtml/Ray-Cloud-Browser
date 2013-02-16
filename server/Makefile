# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert
# Copyright (C) 2012, 2013 Sébastien Boisvert

CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe -std=c++98 -I.
#CXXFLAGS=-O0 -g -D CONFIG_ASSERT -Wall -std=c++98
RM=rm
Q=@

TARGETS=RayCloudBrowser.cgi

EXTRA_TARGETS= RayCloudBrowser.probePath \
	RayCloudBrowser.readJSON RayCloudBrowser-client

LIBRARY_OBJECTS=GraphDatabase.o VertexObject.o Mapper.o PathDatabase.o JSONParser.o JSONNode.o WebService.o \
commands/ObjectFetcher.o commands/GraphManager.o commands/PathHelper.o commands/Explorer.o

%.o: %.cpp
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS) $(EXTRA_TARGETS)

RayCloudBrowser.cgi: webServer_main.o $(LIBRARY_OBJECTS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@
	$(Q)chmod g-w $@
	$(Q)chmod o-w $@

RayCloudBrowser-client: client_main.o $(LIBRARY_OBJECTS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.readJSON: readJSON_main.o $(LIBRARY_OBJECTS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.probePath: probePath_main.o $(LIBRARY_OBJECTS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	$(Q)echo "RM"
	$(Q)$(RM) -f $(TARGETS) $(EXTRA_TARGETS) $(LIBRARY_OBJECTS)

check: devel test-first test-store test-not-found

test-store:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=CATGAAAACGGGTTTTCCCATATTGACGCTA" ./RayCloudBrowser.webServer.cgi

test-first:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE" ./RayCloudBrowser.webServer.cgi

test-not-found:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=fdfddfjdsfdjsclkk" ./RayCloudBrowser.webServer.cgi

path-index:
	./RayCloudBrowser-client createPathDatabase ~/Ray-Cloud-Browser-data/Contigs.fasta ~/Ray-Cloud-Browser-data/Contigs.fasta.dat

graph-index:
	./RayCloudBrowser.createGraphDatabase ~/Ray-Cloud-Browser-data/kmers.txt.sorted ~/Ray-Cloud-Browser-data/kmers.txt.dat

debug-path:
	./RayCloudBrowser.probePath debug  Contigs.fasta.dat|less

test-json:
	./RayCloudBrowser.readJSON  test.json
