CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe

all: creator client

client:
	$(CXX) $(CXXFLAGS) commandLineClient_main.cpp GraphDatabase.cpp VertexObject.cpp -o commandLineClient

creator:
	$(CXX) $(CXXFLAGS) createGraphDatabase_main.cpp -o createGraphDatabase
