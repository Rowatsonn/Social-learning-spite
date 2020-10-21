from dallinger.models import Node, Info

class Pogtwo(Node):
    """Version two of the pot of greed. Handles a lot of the experiment backend."""
    
    __mapper_args__ = {
        "polymorphic_identity": "pot_of_greed_bot"
    }
    
    def __init__(self, network):
        super().__init__(network)

class Donation(Info):
    """Info submitted when the participant is playing the PGG."""

    __mapper_args__ = {"polymorphic_identity": "Donation"}

class Spite(Info):
    """Info submitted when the participant chooses whether to be spiteful"""

    __mapper_args__ = {"polymorphic_identity": "Spite"}

