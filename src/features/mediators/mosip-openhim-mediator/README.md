## MOSIP OpenHIM Mediator

This is an example OpenHIM Mediator which saves the MOSIP generated UIN and VIN into the child's FHIR Patient identifiers.

The mediator route must be protected against attack via a system client JWT.  The token is created by the MOSIP side Mediator.