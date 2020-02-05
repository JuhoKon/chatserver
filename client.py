# Python program to implement client side of chat room.
import socket
import select
import sys

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

IP_address = sys.argv[1]
Port = int(sys.argv[2])
server.connect((IP_address, Port))

username = input("Type your nickname: ")

server.send(username.encode('utf-8'))
# Receives server answer
modifiedSentence = server.recv(1024)
print(modifiedSentence.decode('utf-8'))
print("To send private messages the format goes '/pm name message'")
print("To change channels type /Join channelname")
while True:

    # maintains a list of possible input streams
    sockets_list = [sys.stdin, server]

    """ There are two possible input situations. Either the 
	user wants to give manual input to send to other people, 
	or the server is sending a message to be printed on the 
	screen. Select returns from sockets_list, the stream that 
	is reader for input. So for example, if the server wants 
	to send a message, then the if condition will hold true 
	below.If the user wants to send a message, the else 
	condition will evaluate as true"""
    read_sockets, write_socket, error_socket = select.select(
        sockets_list, [], [])

    for socks in read_sockets:
        if socks == server:
            message = socks.recv(1024)  # buffer size
            print(message.decode('utf-8'))
        else:

            message = input()
            if message != "exit":
                server.send(message.encode('utf-8'))
            else:
                print("Goodbye")
                exit()


server.close()
