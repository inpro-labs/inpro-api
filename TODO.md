1 - Find a way to move auth and session service to application layer (DONE)

2 - Implement ConfigService

3 - Check if all tests are well developed (DONE)

4 - Check if any method is missing (DONE)

PROBLEMS

1 Session can be refreshed infinite times
2 Refactor adapter to mappers

- the idea is that presentation and service has a mappers folder with files like user.mapper.ts
- the mapper must be a class with methods like fromPrismaToDomain, fromDomainToResponse and etc... (or I might think in something funnier)

- Notification

Aproches:

1. Create a single aggregate and generic Aggregate to deal with all types of notifications

- On create, the SendNotification is triggered, and this is what will deal with sending notification process based on the notification.type attribute.

Pros:

- Much less complexity with database modeling
- More simple to define domain model

Cons:

- Require more typing complexity to "safely" define each notification type data
- Need to implement data validation per each type, all in the same place

2. Create an aggregate per each channel and deal separately with each channel, but all in the same table
   as a generic notification with specific data

- On create, a channel specific method is triggered

Pros:

- Easy to maintain

Cons:

- Adds much more complexity to model database
- Adds unnecessary complexity to map data from database

Fix redacted mapping
Fix ID not on Idenfiable type when mapping child entities/VOs
